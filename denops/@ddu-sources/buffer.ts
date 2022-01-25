import {
  BaseSource,
  Context,
  Item,
} from "https://deno.land/x/ddu_vim@v0.1.0/types.ts#^";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v0.1.0/deps.ts#^";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.1.0/file.ts#^";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  kind = "file";

  gather(args: {
    denops: Denops;
    context: Context;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const buflist = (await fn.execute(args.denops, `:buffers`) as string)
          .split("\n");
        const buffers = buflist.filter(Boolean);
        controller.enqueue(
          await Promise.all(buffers.map((buffer) => {
            const bufnr = Number(buffer.match(/^\s*(\d)/)?.[1]);
            return {
              word: `${buffer}`,
              action: {
                bufNr: bufnr,
              },
            };
          })),
        );
      },
    });
  }
  params(): Params {
    return {};
  }
}
