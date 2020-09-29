declare global
{
    namespace NodeJS
    {
        interface ProcessEnv
        {
            ENV: 'docker' | 'local' | 'production';
        }
    }
}

export {}