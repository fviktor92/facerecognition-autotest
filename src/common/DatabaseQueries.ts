import {Pool, QueryResult, QueryResultRow} from 'pg';
import {EnvironmentManager} from "./EnvironmentManager";

export class DatabaseQueries
{
    private static pool: Pool = new Pool(EnvironmentManager.getDatabaseConfig());

    static async getUserByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.users WHERE email=$1;', [email])
                   .then(res => res.rows[0])
                   .catch(err => console.log(err));
    }

    static async getLoginByEmail(email: string): Promise<QueryResultRow>
    {
        return this.pool.query('SELECT * FROM public.login WHERE email=$1;', [email])
                   .then(res => res.rows[0])
                   .catch(err => console.log(err));
    };

    static async deleteUserByEmail(email: string)
    {

    }

}
