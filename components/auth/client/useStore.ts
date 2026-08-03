import { createStore } from "@/actions/stores.actions";
import { StoreInsert } from "@/lib/database/zod/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateStore=()=>{
    const queryClient=useQueryClient()
    return useMutation({
        mutationFn:(data:StoreInsert)=>createStore(data),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['store']})
        }
    })
}