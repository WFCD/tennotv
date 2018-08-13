class Route {
  constructor(route, deps) {
    this.route = route;
    this.deps = deps;
    this.logger = deps.logger;
    this.setHeadersAndJson = deps.setHeadersAndJson;
  }

  async handle(req, res) {
    this.logger.log('silly', `Got ${req.originalUrl}`);
    this.setHeadersAndJson(res, [].concat(this.wfKeys).concat(['pc', 'ps4', 'xb1', 'heartbeat']));
  }
}

module.exports = Route;
