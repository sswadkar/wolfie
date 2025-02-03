import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer({
  target: process.env.NEXT_PUBLIC_PROXY_URL,
  ws: true,
  changeOrigin: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    proxy.web(req, res, { target: process.env.NEXT_PUBLIC_PROD_WEBSOCKET_URL }); // Ensure target matches your WebSocket server
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

