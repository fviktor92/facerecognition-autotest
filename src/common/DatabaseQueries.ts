import {Pool, QueryResultRow} from 'pg';
import {EnvironmentManager} from "./EnvironmentManager";

export class DatabaseQueries
{
    private static pool: Pool = new Pool(EnvironmentManager.getDatabaseConfig());

    // For Cypress
    static databaseTasks = {
        queryUserByEmail(email: string): Promise<QueryResultRow>
        {
            return DatabaseQueries.getUserByEmail(email);
        },

        queryLoginByEmail(email: string): Promise<QueryResultRow>
        {
            return DatabaseQueries.getLoginByEmail(email);
        },

        deleteUserByEmail(email: string): Promise<Number>
        {
            return DatabaseQueries.deleteUserByEmail(email);
        }
    };

    private static async getUserByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.users WHERE email=$1;', [email])
                   .then(res => res.rows[0])
                   .catch(err => console.log(err));
    }

    private static async getLoginByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.login WHERE email=$1;', [email])
                   .then(res => res.rows[0])
                   .catch(err => console.log(err));
    };

    private static async deleteUserByEmail(email: string): Promise<Number>
    {
        let affectedRows: number = 0;
        this.pool.connect((err, client, done) =>
        {
            const shouldAbort: (err: Error) => boolean = (err: Error) =>
            {
                if (err)
                {
                    console.error('Error in transaction', err.stack);
                    client.query('ROLLBACK', err =>
                    {
                        if (err)
                        {
                            console.error('Error rolling back client', err.stack);
                        }
                        done();
                    })
                }
                return !!err;
            };

            client.query('BEGIN', err =>
            {
                if (shouldAbort(err))
                {
                    return;
                }
                const usersDeleteQuery: string = 'DELETE FROM public.users WHERE email=$1;';
                client.query(usersDeleteQuery, [email], (err, res) =>
                {
                    if (shouldAbort(err))
                    {
                        return;
                    }
                    const loginDeleteQuery: string = 'DELETE FROM public.login WHERE email=$1;'
                    client.query(loginDeleteQuery, [email], (err, res) =>
                    {
                        if (shouldAbort(err))
                        {
                            return;
                        }
                        client.query('COMMIT', (err, res) =>
                        {
                            if (err)
                            {
                                console.error('Error committing transaction', err.stack);
                            }
                            done();
                        });
                    });
                });
            });
        });
        return Promise.resolve(affectedRows);
    }
}
