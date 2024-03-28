export const TemplatesQueryString = () => `query MyQuery {
                                        templates {
                                            id
                                            context
                                            archived
                                            title
                                            template_uuid
                                            valid_days
                                            updated_at
                                            }
                                    }`

export const TemplatesQuery = {
    // operationName: 'query_root',
    query: TemplatesQueryString(),
    variables: {},
}
