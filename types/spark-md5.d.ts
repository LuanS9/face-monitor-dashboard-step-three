declare module 'spark-md5' {
    export default class SparkMD5 {
        constructor();
        static hash(str: string, raw?: boolean): string;
        append(str: string): SparkMD5;
        end(raw?: boolean): string;
        reset(): SparkMD5;
    }
}
