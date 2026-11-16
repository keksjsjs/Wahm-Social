import { Markdown } from "./Markdown";

export function StaticPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="container-w max-w-3xl py-14">
      <h1 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
      <div className="card p-6 sm:p-10">
        <Markdown source={body} />
      </div>
    </div>
  );
}
