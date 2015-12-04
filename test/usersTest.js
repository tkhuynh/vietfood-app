var request = require("request"),
		expect = require("chai").expect,
		baseUrl = "http://localhost:3000";

describe("Users", function() {
	it("should show a sign up page on Get /", function (done) {
		request(baseUrl + "/", function (error, response, body) {
			// console.log("RESPONSE", response);
			expect(response.statusCode).to.equal(200);
			done();
		});
	});

	it("should show a log in page on GET /login", function (done) {
		request(baseUrl + "/login", function (err, response, body) {
			expect(response.statusCode).to.equal(200);
			done();
		});
	});

	it("should show a home page on GET /home", function (done) {
		request(baseUrl + "/home", function (err, response, body) {
			expect(response.statusCode).to.equal(200);
			done();
		});
	});

	it("should show a review page on GET /profile", function (done) {
		request(baseUrl + "/review", function (err, response, body) {
			expect(response.statusCode).to.equal(200);
			done();
		});
	});

	it("should show a review page on GET /review", function (done) {
		request(baseUrl + "/profile", function (err, response, body) {
			expect(response.statusCode).to.equal(200);
			done();
		});
	});
});