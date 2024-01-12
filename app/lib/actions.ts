'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoiceSchema = FormSchema.omit({ id: true, date: true });
const EditInvoiceSchema = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return {
        message: 'Database Error: Failed to create Invoice.',
      };
    }
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function editInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = EditInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
  UPDATE invoices
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${id}
`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return {
        message: 'Database Error: Failed to update Invoice.',
      };
    }
  }

  revalidatePath('/dashboard/invoices');
  revalidatePath(`/dashboard/invoices/${id}/edit`);
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return {
        message: 'Database Error: Failed to delete Invoice.',
      };
    }
  }

  revalidatePath('/dashboard/invoices');
}
