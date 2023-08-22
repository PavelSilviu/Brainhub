const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.3" });
const path = require("path");
const doc = {
  info: {
    title: "My API",
    description:
      "This is a Social Media App Server based on OpenAPI 3.0 specification.",
  },
  host: "localhost:5000",
  schemes: ["http"],
  components: {
    "@schemas": {
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          firstName: {
            type: "string",
          },
          lastName: {
            type: "string",
          },
          email: {
            type: "string",
          },
          github: {
            type: "string",
          },
          photo: {
            type: "string",
          },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          description: {
            type: "integer",
          },
          photo: {
            type: "string",
          },
          link: {
            type: "string",
          },
        },
      },
      Follow: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          followerId: {
            type: "integer",
          },
          followingId: {
            type: "integer",
          },
          status: {
            type: "string",
            enum: ["pending", "accepted", "rejected"],
          },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          notificatedId: {
            type: "integer",
          },
          notificatingId: {
            type: "integer",
          },
          content: {
            type: "string",
          },
          viewed: {
            type: "string",
            enum: ["yes", "no"],
          },
        },
      },
      LikeCount: {
        type: "object",
        properties: {
          count: {
            type: "integer",
          },
        },
      },
      FollowStatus: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["pending", "accepted", "rejected"],
          },
        },
      },
    },
  },
};
const output = path.join(__dirname, "autogen.json");
const routes = path.join(__dirname, "index.js");
console.log(output);
console.log(routes);
swaggerAutogen("./autogen.json", ["./index.js"], doc);
