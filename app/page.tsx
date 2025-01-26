"use client";
import { useState, useTransition } from "react";
import LinkPreview, { LinkViewProps } from "@/components/preview/preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimplePreview from "@/components/preview/simple-preview";
import { getPreview } from "@/lib/preview";
import { ModeToggle } from "@/components/mode-toggle";
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

function transformResponse(res: any, url: string): LinkViewProps {
  // Check if res is an object
  if (typeof res !== 'object' || res === null) {
    return {
      title: null,
      description: null,
      image: null,
      url: url,
      siteName: null,
      favicon: null,
    };
  }

  return {
    title: "title" in res ? res.title : null,
    description: "description" in res ? res.description : null,
    image: "images" in res && res.images.length > 0 ? res.images[0] : null,
    url: url,
    siteName: "siteName" in res ? res.siteName : null,
    favicon: "favicons" in res ? getLargestFavicon(res.favicons) : null,
  };
}

export default function LinkPreviews() {
  const [ url, setUrl ] = useState("");
  const [ links, setLinks ] = useState<Array<LinkViewProps | string>>([]);
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
              setLinks((prevLinks) => [data, ...prevLinks]);
              return;
            }
            const linkPreview = transformResponse(data, copy);
            setLinks((prevLinks) => [linkPreview, ...prevLinks]);
          });
    });

  };

  return (
      <>
        <ModeToggle />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-50">
          <form className="w-80 flex flex-col items-center" onSubmit={getData}>
            <Input
                value={url}
                disabled={isPending}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="Enter a URL" />
            <br />
            <Button type="submit" disabled={isPending} className="m-3">
              {isPending ? <BeatLoader /> : "Generate preview"}
            </Button>
            <br />
            <div className="flex flex-col gap-4">
              {links.map((link, index) => {
                if (typeof link === "string") {
                  return <SimplePreview key={index} url={link} />;
                } else {
                  return <LinkPreview key={index} preview={link} />;
                }
              })}
            </div>
          </form>
        </div>
      </>
  );
};