const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClientsCount = 0;
  }

  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      this.connectedClientsCount++;
      console.log(`[Socket.io] Client terhubung: ${socket.id} (Total: ${this.connectedClientsCount})`);

      socket.on('disconnect', () => {
        this.connectedClientsCount = Math.max(0, this.connectedClientsCount - 1);
        console.log(`[Socket.io] Client terputus: ${socket.id} (Sisa: ${this.connectedClientsCount})`);
      });
    });
  }

  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  broadcastDeviceUpdate(device) {
    this.emit('device:update', device);
  }

  broadcastIncidentNew(incident) {
    this.emit('incident:new', incident);
  }

  broadcastIncidentResolved(incident) {
    this.emit('incident:resolved', incident);
  }

  broadcastSummary(summary) {
    this.emit('stats:summary', summary);
  }

  broadcastMetricSample(sample) {
    this.emit('metric:sample', sample);
  }
}

module.exports = new SocketService();
