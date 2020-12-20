/**
 * @fileoverview Example of HTTP rewrite of request header.
 *
 * @supported Quantumult X (v1.0.5-build188)
 *
 * [rewrite_local]
 * ^http://example\.com/resource9/ url script-request-header sample-rewrite-request-header.js
 */

// $request.scheme, $request.method, $request.url, $request.path, $request.headers


var headers = JSON.parse(JSON.stringify($request.headers).replace(/4\.\d\.\d/g,"4.10.1"))


var modifiedHeaders = headers;
var modifiedPath = $request.path.replace(/4\.\d\.\d/g,"4.10.1")

$done({path: modifiedPath, headers : modifiedHeaders});
