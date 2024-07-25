import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'


export const blogRouter = new Hono<{
	Bindings: {
		CONNECTIONPOOL_URL: string
    JWT_SECRET  : string
	},
    Variables:{
        userId:string
    }
}>()

blogRouter.use("/*",async(c,next)=>{
    try {
        const token = c.req.header("Authorization") || ""
        const user = await verify(token,c.env.JWT_SECRET)
        //@ts-ignore
        c.set("userId",user.id)
        await next()
    } catch (error) {
        c.status(403)
        return c.json({"error":"not authenticated please signin"})
    }
})


blogRouter.post('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.CONNECTIONPOOL_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    try {
        const blog = await prisma.blog.create({
            data:{
                title:body.title,
                content:body.content,
                authorId:c.get("userId")
            }
        })
        return c.json({"msg":"blog successfully posted","id":blog.id})
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({"error":"unable to create blog please try again after sometime"})
    }
})
  
blogRouter.put('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.CONNECTIONPOOL_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    try {
        const blog = await prisma.blog.update({
            where:{
                id:body.id
            },
            data:{
                title:body.title,
                content:body.content,
            }
        })
        return c.json({"msg":"blog successfully updated","id":blog.id})
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({"error":"unable to update the blog please try again after sometime"})
    }
})
  
blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.CONNECTIONPOOL_URL,
    }).$extends(withAccelerate())

    
    try {
        const blogs = await prisma.blog.findMany()
        
        return c.json(blogs)
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({"error":"unable to fetch blogs please try again after sometime"})
    }
})

blogRouter.get('/:id', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.CONNECTIONPOOL_URL,
    }).$extends(withAccelerate())

    const id = c.req.param("id")
    try {
        const blog = await prisma.blog.findFirst({
            where:{
                id:id
            }
        })
        
        return c.json(blog)
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({"error":"unable to fetch the blog please try again after sometime"})
    }
})
  

  