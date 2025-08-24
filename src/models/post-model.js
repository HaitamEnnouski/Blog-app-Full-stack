const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { readJSON, writeJSON } = require("../utils/file-store");

const filepath = path.join(__dirname, "../../data/posts.json");

// Basic CRUD
async function Findall() {
    const data = await readJSON(filepath);
    return data.posts;
}

async function FindById(id) {
    const data = await readJSON(filepath);
    const post = data.posts.find((p) => p.id == id);
    if (!post) throw new Error(`Post with id ${id} not found`);
    return post;
}

async function createPost(post) {
    const data = await readJSON(filepath);
    post.id = uuidv4();
    post.createdAt = new Date().toISOString();
    post.updatedAt = post.createdAt;
    data.posts.push(post);
    await writeJSON(filepath, data);
    return post;
}

async function updatePost(id, updatedPost) {
    const data = await readJSON(filepath);
    const index = data.posts.findIndex((p) => p.id == id);
    if (index === -1) throw new Error(`Post with id ${id} not found`);

    const existingPost = data.posts[index];

    // Merge old post with updated data
    const mergedPost = {
        ...existingPost,         // keep createdAt and other fields
        ...updatedPost,          // overwrite with new values
        id: existingPost.id,     // ensure ID stays the same
        updatedAt: new Date().toISOString()  // update timestamp
    };

    data.posts[index] = mergedPost;
    await writeJSON(filepath, data);
    return mergedPost;
}


async function deletePost(id) {
    const data = await readJSON(filepath);
    const index = data.posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Post with id ${id} not found`);

    data.posts.splice(index, 1);
    await writeJSON(filepath, data);
    return { message: `Post with id ${id} deleted successfully` };
}

// New: query for search / sort / paginate
// async function queryPosts({
//     q,
//     sort = "createdAt",
//     order = "asc",
//     page = 1,
//     limit = 10,
// }) {
//   let posts = await Findall();

//   // 1. Filter by search
//   if (q) {
//     posts = posts.filter(
//       (p) =>
//         p.title.toLowerCase().includes(q.toLowerCase()) ||
//         p.content.toLowerCase().includes(q.toLowerCase())
//     );
//   }

//   // 2. Sort
//   if (sort === "createdAt") {
//     posts = posts.sort((a, b) =>
//       order === "asc"
//         ? new Date(a.createdAt) - new Date(b.createdAt)
//         : new Date(b.createdAt) - new Date(a.createdAt)
//     );
//   } else if (sort === "title") {
//     posts = posts.sort((a, b) =>
//       order === "asc"
//         ? a.title.localeCompare(b.title)
//         : b.title.localeCompare(a.title)
//     );
//   }

//   // 3. Paginate
//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;
//   const items = posts.slice(startIndex, endIndex);

//   return {
//     items,
//     total: posts.length,
//     page: Number(page),
//     limit: Number(limit),
//   };
// }

module.exports = {
    Findall,
    FindById,
    createPost,
    updatePost,
    deletePost,
    // queryPosts,
};
