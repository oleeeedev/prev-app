"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPreview } from "@/lib/preview";
import { BeatLoader } from "react-spinners";

function getLargestFavicon(favicons: string[]): string {
  return favicons.sort((a: string, b: string) => {
    const matchA = a.match(/favicon-(\d+)/);
    const matchB = b.match(/favicon-(\d+)/);
    const sizeA = matchA ? parseInt(matchA[1]) : 0;
    const sizeB = matchB ? parseInt(matchB[1]) : 0;
    return sizeB - sizeA;
  })[0];
}


export default function LinkPreviews() {
  const [ url, setUrl ] = useState("");
  const [ isPending, startTransition ] = useTransition();

  const getData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const copy = url;
    setUrl("");
    startTransition(async () => {
      await getPreview(url)
          .then((data) => {
            console.log(data);
            if (typeof data === "string") {
              return;
            }
          });
    });

  };

};