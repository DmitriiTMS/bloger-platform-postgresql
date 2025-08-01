export type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: any,
    createdAt: string
}

export type UpdatePostByBlogId = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    postId: number
}