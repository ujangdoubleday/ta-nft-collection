import { z } from 'zod';
import { router, publicProcedure } from '@/lib/api/trpc/server';
import prisma from '@/lib/db';

export const todoRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        authorName: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // Check if the todo model exists on the prisma client
        if (!prisma.todo) {
          throw new Error(
            'Todo model not available on Prisma client. Please check your Prisma setup.',
          );
        }

        const where = input.authorName ? { authorName: input.authorName } : {};

        return await prisma.todo.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error: any) {
        console.error('Error in todo.getAll:', error);
        throw new Error(`Failed to get todos: ${error.message}`);
      }
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.todo.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        authorName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Check if the todo model exists on the prisma client
        if (!prisma.todo) {
          throw new Error(
            'Todo model not available on Prisma client. Please check your Prisma setup.',
          );
        }

        return await prisma.todo.create({
          data: {
            title: input.title,
            description: input.description,
            authorName: input.authorName || 'Anonymous',
          },
        });
      } catch (error: any) {
        console.error('Error in todo.create:', error);
        throw new Error(`Failed to create todo: ${error.message}`);
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        completed: z.boolean().optional(),
        authorName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.todo.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.todo.delete({
        where: { id: input.id },
      });
    }),

  toggleCompleted: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Check if the todo model exists on the prisma client
        if (!prisma.todo) {
          throw new Error(
            'Todo model not available on Prisma client. Please check your Prisma setup.',
          );
        }

        const todo = await prisma.todo.findUnique({
          where: { id: input.id },
        });

        if (!todo) {
          throw new Error('Todo not found');
        }

        return await prisma.todo.update({
          where: { id: input.id },
          data: { completed: !todo.completed },
        });
      } catch (error: any) {
        console.error('Error in todo.toggleCompleted:', error);
        throw new Error(`Failed to toggle todo: ${error.message}`);
      }
    }),

  // Simple test procedure that doesn't depend on the Todo model
  test: publicProcedure.query(() => {
    return {
      success: true,
      message: 'tRPC todo router is working',
      prismaModels: Object.keys(prisma).filter((key) => !key.startsWith('_')),
      hasTodoModel: !!prisma.todo,
    };
  }),
});
