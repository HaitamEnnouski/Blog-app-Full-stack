function ValidatePostCreate(post) {
    try {
        if (!post.title || post.title.length < 3) {
            return { value: null, error: { message: "Title must be at least 3 characters long", field: "title" } };
        }
        if (!post.content || post.content.length < 10) {
            return { value: null, error: { message: "Content must be at least 10 characters long", field: "content" } };
        }
        if (!post.author || post.author.length < 3) {
            return { value: null, error: { message: "Author name must be at least 3 characters long", field: "author" } };
        }
        if (post.tags !== undefined) {        
            if (!Array.isArray(post.tags)) {
                return { value: null, error: { message: "Tags must be an array", field: "tags" } };
            }
            if (post.tags.length > 20) {
                return { value: null, error: { message: "Tags cannot have more than 20 items", field: "tags" } };
            }
            for (const tag of post.tags) {
                if (typeof tag !== "string") {
                    return { value: null, error: { message: "Each tag must be a string", field: "tags" } };
                }
            }
        }

        return { value: post, error: null };

    } catch (err) {
        throw new Error(`Validation failed: ${err.message}`);
    }
}

function ValidatePostUpdate(post) {
    if (post.title !== undefined && post.title.length < 3) {
        return { value: null, error: { message: "Title must be at least 3 characters long", field: "title" } };
    }

    if (post.content !== undefined && post.content.length < 10) {
        return { value: null, error: { message: "Content must be at least 10 characters long", field: "content" } };
    }

    if (post.author !== undefined && post.author.length < 3) {
        return { value: null, error: { message: "Author name must be at least 3 characters long", field: "author" } };
    }

    if (post.tags !== undefined) {
        if (!Array.isArray(post.tags)) {
        return { value: null, error: { message: "Tags must be an array", field: "tags" } };
        }
        if (post.tags.length > 20) {
        return { value: null, error: { message: "Tags cannot have more than 20 items", field: "tags" } };
        }
        for (const tag of post.tags) {
        if (typeof tag !== "string") {
            return { value: null, error: { message: "Each tag must be a string", field: "tags" } };
        }
        }
    }

    return { value: post, error: null };
}

module.exports = {
    ValidatePostCreate,
    ValidatePostUpdate
};
