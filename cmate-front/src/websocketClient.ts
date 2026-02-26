import WebSocket from 'ws';

type MessageHandler = (msg: string) => void;
type InfoHandler = (info: string) => void;

export default class WebSocketClient {
  private ws?: WebSocket;
  private getUrl: () => string;
  private onMessage: MessageHandler;
  private onInfo: InfoHandler;
  private reconnectDelay = 1000;
  private maxDelay = 30000;
  private shouldReconnect = true;
  private connecting = false;

  constructor(getUrl: () => string, onMessage?: MessageHandler, onInfo?: InfoHandler) {
    this.getUrl = getUrl;
    this.onMessage = onMessage || (() => {});
    this.onInfo = onInfo || (() => {});
  }

  public async connect(): Promise<void> {
    if (this.connecting && this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.shouldReconnect = true;
    this.connecting = true;

    const tryConnect = () => {
      const url = this.getUrl();
      this.onInfo(`Connecting to ${url}`);
      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        this.onInfo('Connected to backend');
        this.reconnectDelay = 1000;
        this.connecting = false;
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        const text = typeof data === 'string' ? data : data.toString();
        this.onMessage(text);
      });

      this.ws.on('error', (err: Error) => {
        this.onInfo(`WebSocket error: ${err.message}`);
      });

      this.ws.on('close', () => {
        this.onInfo('Disconnected from backend');
        if (!this.shouldReconnect) return;
        setTimeout(() => {
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
          tryConnect();
        }, this.reconnectDelay);
      });
    };

    tryConnect();
  }

  public async send(message: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.waitForOpen(10000);
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(message);
  }

  private waitForOpen(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return resolve();
        if (Date.now() - start > timeout) return resolve();
        setTimeout(check, 100);
      };
      check();
    });
  }

  public async close(): Promise<void> {
    this.shouldReconnect = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
    }
  }
}
