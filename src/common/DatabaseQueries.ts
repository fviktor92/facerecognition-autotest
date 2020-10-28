import {Pool, QueryResultRow} from 'pg';
import {EnvironmentManager} from "./EnvironmentManager";

/**
 * Provides access to the current environment's database.
 */
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

    /**
     * Executes a select query with the given email in the 'users' table.
     * @param {string} email The expected email of the user.
     * @returns {Promise<QueryResultRow>}
     * @throws Error If the user could not be found
     */
    public static async getUserByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.users WHERE email=$1;', [email])
                   .then(res =>
                   {
                       if (res.rowCount === 1)
                       {
                           return res.rows[0];
                       } else
                       {
                           throw new Error(`No user found with ${email}`);

                       }
                   })
    }

    /**
     * Executes a select query with the given email in the 'login' table.
     * @param {string} email The expected email of the user.
     * @returns {Promise<QueryResultRow>}
     * @throws Error If the user could not be found
     */
    public static async getLoginByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.login WHERE email=$1;', [email])
                   .then(res =>
                   {
                       if (res.rowCount === 1)
                       {
                           return res.rows[0];
                       } else
                       {
                           throw new Error(`No user found with ${email}`);
                       }
                   });
    };

    /**
     * Executed a delete query with the given email in the 'users' and 'login' table.
     * @param {string} email The expected email of the user.
     * @returns {Promise<Number>}
     */
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
