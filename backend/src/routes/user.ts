import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'


export const userRouter = new Hono<{
	Bindings: {
		CONNECTIONPOOL_URL: string
    JWT_SECRET  : string
	}
}>()

userRouter.post('/api/v1/user/signup', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.CONNECTIONPOOL_URL,
  }).$extends(withAccelerate())
  
    const body = await c.req.json()
    try {
        const user = await prisma.user.create({
          data:{
            email:body.email,
            password:body.password
          }
        })
        const jwt = await sign({id:user.id},c.env.JWT_SECRET)
        return c.json({jwt})
    } catch (error) {
      console.log(error)
      c.status(403)
      return c.json({ error: "error while signing up" });
    } 
    
})

userRouter.post('/api/v1/user/signin', async(c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.CONNECTIONPOOL_URL,
  }).$extends(withAccelerate())
  
    const body = await c.req.json()
    try {
        const user = await prisma.user.findUnique({
          where: {
            email: body.email
          }
        });
  
        if(!user){
          c.status(403)
          return c.json({error:"user already exists"})
        }else{
          const jwt = await sign({id:user.id},c.env.JWT_SECRET)
          return c.json({jwt})
        }
        
    } catch (error) {
      console.log(error)
      c.status(403)
      return c.json({ error: "error while signing in" });
    } 
    
})  