export type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    createdAt: string
}

export type UpdatePostByBlogId = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    postId: number
}