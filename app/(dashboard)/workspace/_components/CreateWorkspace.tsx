"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2Icon, PlusCircleIcon, School2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceSchema, WorkspaceSchemaType } from "@/app/schemas/workspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

export function CreateWorkspace() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  //define form
  const form = useForm({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  //connect with create workspace
  const createWorkspaceMutation = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: (newWorksSpace) => {
        toast.success(
          `workspace ${newWorksSpace.workspaceName} created successfully.`
        );

        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to create workspace.");
      },
    })
  );

  //define submit handler
  function onSubmit(values: WorkspaceSchemaType) {
    createWorkspaceMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-200"
            >
              <PlusCircleIcon className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Create a Workspace</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new Workspace</DialogTitle>
          <DialogDescription>
            Create new workspace to collaborate with your team
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter name for your Workspace"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public workspace name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={createWorkspaceMutation.isPending}>
              {createWorkspaceMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <School2Icon className="size-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
