"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/utils/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedData = loginSchema.safeParse(data);

  if (!validatedData.success) {
    const formFieldErrors = validatedData.error.flatten().fieldErrors;
    console.error(formFieldErrors); // fix error handling later
    redirect("/error");
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/logged-in");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const validatedData = loginSchema.safeParse(data);
  if (!validatedData.success) {
    const formFieldErrors = validatedData.error.flatten().fieldErrors;
    console.error(formFieldErrors); // fix error handling later
    redirect("/error");
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }
  console.log("User created successfully", data.email);

  revalidatePath("/", "layout");
  redirect("/logged-in");
}
