const {Findall, FindById,createPost,updatePost,deletePost} = require("../models/post-model");
const { ValidatePostCreate , ValidatePostUpdate} = require("../utils/validate");


const GetAllPosts = async (req, res) => {
    try {
        let posts = await Findall();

        // Extract query params
        const { page = 1, limit = 10, q,sort = "createdAt" ,order = "asc" } = req.query;

        // Search filter
        if (q) {
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(q.toLowerCase()) ||
            post.content.toLowerCase().includes(q.toLowerCase())
        );
        }

        // Sorting by createdAt or title
        if (sort === "createdAt") {
            posts = posts.sort((a, b) => {
                return order === "asc"
                ? new Date(a.createdAt) - new Date(b.createdAt)
                : new Date(b.createdAt) - new Date(a.createdAt);
            });
        } else if (sort === "title") {
            posts = posts.sort((a, b) => {
                return order === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            });
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        res.status(200).json({
        data: {
            items: paginatedPosts,
            page: Number(page),
            limit: Number(limit),
            total: posts.length
        },
        error: null
})
    } catch (err) {
        res.status(500).json({ error: `Failed to retrieve posts: ${err.message}` });
    }
};

const GetPostById = async (req, res) => {
    const {id} = req.params;
    try{
        const post = await FindById(id);
        res.status(200).json(post);
    }catch(err){
        res.status(404).json({error: `Post not found: ${err.message}`});
    }
}

const CreatePost = async (req, res) => {
    const newPost = req.body;
    const { value, error } = ValidatePostCreate(newPost);

    if (error) {
        return res
        .status(400)
        .json({ data: null, error: { message: error.message, field: error.field } });
    }

    try {
        const createdPost = await createPost(newPost);
        res.status(201).json({
        data: {
            items: [createdPost],  
            page: 1,
            limit: 1,
            total: 1
        },
        error: null
        });
    } catch (err) {
        res.status(500).json({ data: null, error: { message: err.message } });
    }
};


const UpdatePost = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    const { value, error } = ValidatePostCreate(updatedData);
    if (error) {
        return res
        .status(400)
        .json({ data: null, error: { message: error.message, field: error.field } });
    }

    try {
        const updatedPost = await updatePost(id, updatedData);
        res.status(200).json({
        data: {
            items: [updatedPost],
            page: 1,
            limit: 1,
            total: 1
        },
        error: null
        });
    } catch (err) {
        res.status(404).json({ data: null, error: { message: err.message } });
    }
};

const DeletePost = async (req, res) => {
    const { id } = req.params;
    try {
        await deletePost(id);
        res.status(204).send();
    } catch (err) {
        res.status(404).json({ error: `Failed to delete post: ${err.message}` });
    }
}

module.exports = {
    GetAllPosts,
    GetPostById,
    CreatePost,
    UpdatePost,
    DeletePost
}