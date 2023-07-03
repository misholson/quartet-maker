import { useMutation } from "@tanstack/react-query"

export const useSaveSong = () => {
    return useMutation({
        mutationFn: (newSong) => {
            return fetch("/api/updateSong", {
                method: "POST",
                body: JSON.stringify(newSong)
            });
        }
    })
}