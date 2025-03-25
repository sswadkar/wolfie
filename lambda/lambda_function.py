import boto3
import json
import os

from AthenaQueryHandler import AthenaQueryHandler

# Initialize AWS clients
apigw = boto3.client("apigatewaymanagementapi", endpoint_url=os.getenv("WEBSOCKET_ENDPOINT"))
bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
bedrock_agent_runtime_client = boto3.client("bedrock-agent-runtime", region_name="us-east-1")
inference_profile_arn = os.getenv("INFERENCE_PROFILE_ARN")
knowledge_base_id = os.getenv("KNOWLEDGE_BASE_ID")

def lambda_handler(event, context):
    """ Main WebSocket Lambda handler """
    print(event)
    route_key = event["requestContext"]["routeKey"]
    connection_id = event["requestContext"]["connectionId"]

    if route_key == "$connect":
        return handle_connect()
    elif route_key == "$disconnect":
        return handle_disconnect()
    elif route_key == "sendMessage":
        return handle_message(connection_id, event)
    else:
        return {"statusCode": 400, "body": "Invalid route"}

def handle_connect():
    """ Handles new WebSocket connections """
    return {"statusCode": 200, "body": "Connected"}

def handle_disconnect():
    """ Handles WebSocket disconnections """
    return {"statusCode": 200, "body": "Disconnected"}

def handle_message(connection_id, event):
    """ Handles incoming WebSocket messages """
    try:
        # Parse incoming message
        body = json.loads(event["body"])

        # Extract user message and mode
        user_message = body.get("message", "")
        mode = body.get("mode", "document")  # default to "document" if not provided

        if mode == "database":
            # Branch: Database query flow
            print("Handling database mode")
            response_text = query_database(user_message)
        else:
            # Branch: Document-based knowledge base flow
            print("Handling document mode")
            response_text = query_knowledge_base(user_message)

        # Send response back to client
        send_message(connection_id, {"response": response_text})

        return {"statusCode": 200, "body": "Message sent"}
    except Exception as e:
        print(f"Error processing message: {e}")
        return {"statusCode": 500, "body": "Error processing message"}

#
# ----------------------------- DOCUMENT MODE LOGIC -----------------------------
#
def query_knowledge_base(prompt):
    """ Calls AWS Bedrock to query knowledge base (existing flow) """
    try:
        response = bedrock_agent_runtime_client.retrieve_and_generate(
            input={"text": prompt},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledge_base_id,
                    "modelArn": inference_profile_arn,
                },
            },
        )

        response_text = response.get("output", {}).get("text", "No response generated")
        citations = response.get("citations", [])

        # Format source information
        formatted_sources = []
        for citation in citations:
            retrieved_references = citation.get("retrievedReferences", [])
            for source in retrieved_references:
                content = source.get("content", {}).get("text", "No content available")
                location = source.get("location", {})
                source_url = (
                    location.get("webLocation", {}).get("url")
                    or location.get("confluenceLocation", {}).get("url")
                    or location.get("salesforceLocation", {}).get("url")
                    or location.get("sharePointLocation", {}).get("url")
                    or location.get("kendraDocumentLocation", {}).get("uri")
                    or location.get("s3Location", {}).get("uri")
                    or location.get("customDocumentLocation", {}).get("id")
                    or location.get("sqlLocation", {}).get("query")
                    or "No source URL"
                )
                metadata = source.get("metadata", {})

                formatted_sources.append(
                    {
                        "source_text_span": citation.get("generatedResponsePart", {})
                                             .get("textResponsePart", {})
                                             .get("span", {}),
                        "source_text": citation.get("generatedResponsePart", {})
                                               .get("textResponsePart", {})
                                               .get("text", "No extracted text"),
                        "source_url": source_url,
                        "page_content": content,
                        "metadata": metadata,
                    }
                )

        return {
            "response": response_text,
            "sources": formatted_sources
        }

    except Exception as e:
        print(f"Bedrock Query Error: {e}")
        return "Error querying knowledge base"

#
# ----------------------------- DATABASE MODE LOGIC -----------------------------
#

def format_header(header):
    return ' '.join(word.capitalize() for word in header.split('_'))

def query_database(prompt):
    """
    Uses the AthenaQueryHandler to:
      1) Generate an SQL statement from the user's natural-language prompt.
      2) Execute the query in Athena.
      3) Return the results or a descriptive error.
    """
    try:
        # Athena query handler
        athena_handler = AthenaQueryHandler()

        # 1) Generate the SQL query
        sql_query = athena_handler.generate_query(prompt)
        print(f"Generated SQL: {sql_query}")

        # 2) Execute the Athena query
        result = athena_handler.query_athena(sql_query)
        product_info = result["response"]
        errors = result["error"]
        sql_query = result["sql_query"]

        if errors:
            return {
                "response_text": None,
                "errors": f"Error: {errors}",
                "data": None,
                "sql_query": sql_query
            }

        if not product_info:
            return {
                "response_text": "No product info found.",
                "errors": f"Error: {errors}",
                "data": None,
                "sql_query": sql_query
            }

        PRODUCT_HEADERS = "proprietary_name,ndc_product_code,product_type_name,product_kits_flag,strength,dosage_name,market_category_name,market_status,product_market_status,fda_approved,product_fee_status,market_start_date,market_end_date,discontinue_date,submission_date,labeler_firm_name,labeler_firm_duns,labeler_ndc_code,registrant_firm_name,registrant_firm_duns,document_num,doc_type_code,applicant_firm_name,application_number"

        details = (
            f"The user asked you: {prompt}. "
            f"Output the following information, if it pertains to multiple products, tell the user that. "
            f"If you don't know, then only output the information you receive. "
            f"If there is product info, it is in CSV format with the following headers: {PRODUCT_HEADERS}. "
            f"Briefly summarize the product information by listing out the names of the products retrieved. "
            f"Here is the prompt information:"
        )

        products = product_info.rstrip().split("\n")

        headers = [
            "Proprietary Name",
            "NDC Product Code",
            "Product Type Name",
            "Product Kits Flag",
            "Strength",
            "Dosage Name",
            "Market Category Name",
            "Market Status",
            "Product Market Status",
            "FDA Approved",
            "Product Fee Status",
            "Market Start Date",
            "Market End Date",
            "Discontinue Date",
            "Submission Date",
            "Labeler Firm Name",
            "Labeler Firm DUNS",
            "Labeler NDC Code",
            "Registrant Firm Name",
            "Registrant Firm DUNS",
            "Document Number",
            "Document Type Code",
            "Applicant Firm Name",
            "Application Number"
        ]


        product_list = [
            {k: v for k, v in zip(headers, product.split(","))}
            for product in products
        ]

        product_string = ""
        formatted_headers = format_header(PRODUCT_HEADERS)

        for product in products:
            product_dict = {k: v for k, v in zip(formatted_headers.split(','), product.split(','))}
            product_string += str(product_dict) + "\n"

        final_query = details + product_string

        return {
                "response_text": athena_handler.bedrock_query_llm(final_query),
                "data": product_list,
                "errors": None,
                "sql_query": sql_query
            }

    except Exception as e:
        print(f"Error in query_database: {e}")
        return {
            "response_text": None,
            "data": None,
            "errors": f"Database query error: {e}",
            "sql_query": sql_query
        }

#
# ----------------------------- SHARED UTILITY -----------------------------
#
def send_message(connection_id, message):
    """ Sends a message back to the WebSocket client """
    try:
        apigw.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(message),
        )
    except Exception as e:
        print(f"Send Message Error: {e}")
