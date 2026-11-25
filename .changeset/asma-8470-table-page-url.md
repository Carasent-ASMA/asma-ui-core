---
'asma-ui-core': minor
---

ASMA-8470: a table can keep its page in the URL, so Back, Forward, a reload and a link open the page the
user was on instead of the first one.

`StyledTable` gets an opt-in `pageUrlParam` (`page` for a list page). The first page leaves the parameter
out. Paging replaces the current history entry and never adds one, so one Back still leaves the list,
and the entry's `history.state` and the other search parameters are kept. The page is read before the
first paint, waits for rows that load after mount, and a page past the end opens the last page. It goes
back to the first page, and the parameter with it, whenever the table resets its page: rows that change
(a filter or a search), a sort or a new page size. A table whose app owns the pagination is left alone.

For that case, server-side paging included, `useControlledPageUrlParam(param, pageIndex, setPageIndex)`
writes the app's page into the URL the same way and takes it back on Back and Forward, and
`readPageIndexFromUrl(param)` gives the page to open on where the app creates its state.
