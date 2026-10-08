<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- The teammate's frontend is plain HTML/CSS/JS in `frontend/public/site/`; `/` redirects there. Do not restyle it — backend work only touches `frontend/public/site/js/*` and script tags. Why: the frontend is owned by another team member.
- All data access goes through `frontend/public/site/js/backend.js` (Lovable Cloud client via CDN ESM) and is protected by RLS. Why: static pages have no server, so security lives in database policies.
