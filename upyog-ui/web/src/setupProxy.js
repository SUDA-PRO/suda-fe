const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const fs   = require("fs");

const createProxy = createProxyMiddleware({
  target: process.env.REACT_APP_PROXY_URL,
  changeOrigin: true,
});

module.exports = function (app) {
  // ── Local dev: serve kml-geo files at the PUBLIC_URL-prefixed path ──────
  // CRA 4 sets PUBLIC_URL="/suda-ui" (from homepage) even in dev, but the
  // dev server serves public/ at "/" with no prefix.  This middleware serves
  // /suda-ui/kml-geo/* directly from public/kml-geo/* so fetches succeed.
  const kmlGeoDir = path.join(__dirname, "..", "public", "kml-geo");
  app.use("/suda-ui/kml-geo", function (req, res, next) {
    const filePath = path.join(kmlGeoDir, decodeURIComponent(req.path));
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath);
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.end(content);
      }
    } catch (_) {}
    next();
  });

  [
    "/egov-mdms-service",
    "/egov-location",
    "/localization",
    "/egov-workflow-v2",
    "/pgr-services",
    "/filestore",
    "/egov-hrms",
    "/user-otp",
    "/user",
    "/fsm",
    "/billing-service",
    "/collection-services",
    "/pdf-service",
    "/pg-service",
    "/vehicle",
    "/vendor",
    "/property-services",
    "/fsm-calculator/v1/billingSlab/_search",
    "/asset-services/v1/disposal/_create",
    "/requester-services-dx",
    "/bpa-services/v1/preapprovedplan/_search",
    "/bpa-calculator/_estimate",
    "/requester-services-dx/eSign/filestoreId/v1/_search",
    "/inbox",
    "/ws-services",
    "/sw-services",
    "/ws-calculator"
  ].forEach((location) =>
    app.use(location, createProxy)
  );
};