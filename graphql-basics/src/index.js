import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

// Scalar type - String, Boolean, Int, Float, ID,

let users = [
	{
		id: "1",
		name: "Pietro",
		email: "pietro@balestra.dev",
		age: 28
	},
	{
		id: "2",
		name: "Dafo",
		email: "didier@dafond.dev",
		age: 29
	},
	{
		id: "3",
		name: "Mike",
		email: "mike@dafond.dev",
		age: 30
	}
];
const posts = [
	{
		id: "11",
		title: "Post 1",
		body: "lorem ipsum",
		published: true,
		author: "1"
	},
	{
		id: "22",
		title: "Post 2",
		body: "lorem ipsum",
		published: false,
		author: "1"
	},
	{
		id: "33",
		title: "Post 3",
		body: "lorem ipsum",
		published: false,
		author: "2"
	}
];

const comments = [
	{
		id: "111",
		text: "Comment 1",
		author: "1",
		post: "11"
	},
	{
		id: "222",
		text: "Comment 2",
		author: "1",
		post: "11"
	},
	{
		id: "333",
		text: "Comment 3",
		author: "2",
		post: "22"
	},
	{
		id: "444",
		text: "Comment 4",
		author: "3",
		post: "33"
	}
];

// Type definition (schema)
const typeDefs = `
    type Query {
        comments: [Comment!]!
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID): Comment!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!,
        body: String!,
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`;

// Resolvers
const resolvers = {
	Query: {
		users(parent, { query }) {
			if (!query) return users;

			return users.filter(user =>
				user.name.toLowerCase().includes(query.toLowerCase())
			);
		},
		posts(parent, { query }) {
			if (!query) return posts;

			return posts.filter(
				post =>
					post.title.toLowerCase().includes(query.toLowerCase()) ||
					post.body.toLowerCase().includes(query.toLowerCase())
			);
		},
		comments(parent, { query }) {
			return comments;
		},
		me() {
			return {
				id: "123",
				name: "Mike",
				email: "mike@mike.com",
				age: 29
			};
		},
		post() {
			return {
				id: "123",
				title: "Post title",
				body: "Post content",
				published: true
			};
		}
	},
	Mutation: {
		createUser(parent, { name, email, age }, ctx, info) {
			const emailTaken = users.some(user => user.email === email);
			if (emailTaken) throw new Error("Email taken");
			const user = {
				id: uuidv4(),
				name,
				email,
				age
			};
			users.push(user);
			return user;
		},
		createPost(parent, { title, body, pulished, author }) {
			const userExist = users.some(user => user.id === author);
			if (!userExist) throw new Error("User not found");
			const post = {
				id: uuidv4(),
				title,
				body,
				pulished,
				author
			};
			posts.push(post);
			return post;
		},
		createComment(parent, { text, author, post }) {
			const userExist = users.some(user => user.id === author);
			const postExist = posts.some(
				post => post.id === post && post.published
			);
			if (!userExist || !postExist || post)
				throw new Error("Unable to find user and post");
			const comment = {
				id: uuidv4(),
				text,
				author,
				post
			};
			comments.push(comment);
			return comment;
		}
	},
	Post: {
		author(parent) {
			return users.find(user => user.id === parent.author);
		},
		comments(parent) {
			return comments.filter(comment => comment.post === parent.id);
		}
	},
	Comment: {
		author(parent) {
			return users.find(user => user.id === parent.author);
		},
		post(parent) {
			return posts.find(post => post.id === parent.post);
		}
	},
	User: {
		posts(parent) {
			return posts.filter(post => post.id === parent.post);
		},
		comments(parent) {
			return comments.filter(comment => comment.author == parent.id);
		}
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});

server.start(() => {
	console.log("The server is up!");
});
