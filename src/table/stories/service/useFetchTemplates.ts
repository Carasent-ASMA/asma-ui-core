import { useEffect, useState } from 'react'
import type { ITemplate } from './types'
import { TemplatesQuery } from './Templates.query'

export const useFetchTemplates = (): { data: ITemplate[] } => {
    const [data, setData] = useState<ITemplate[]>([])

    useEffect(() => {
        const getDatadata = async (): Promise<void> => {
            // Best-effort: this proxy endpoint isn't available in every environment (e.g. CI/test
            // runs without STORYBOOK_PROXY_ENDPOINT configured) — fail quietly rather than throwing
            // an unhandled rejection that fails the whole `test-storybook` run regardless of any
            // individual story's pass/fail state. `data` just stays the empty-array default.
            try {
                const response = await fetch(import.meta.env['STORYBOOK_PROXY_ENDPOINT'] as string, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-hasura-admin-secret': import.meta.env['STORYBOOK_PROXY_SECRET'] as string,
                    },
                    body: JSON.stringify(TemplatesQuery),
                })

                if (!response.ok) return

                const res = (await response.json()) as { data: { templates: ITemplate[] } }

                setData(res.data.templates)
            } catch {
                // Network error / non-JSON body — nothing to show, nothing to crash.
            }
        }

        void getDatadata()
    }, [])
    return { data }
}
