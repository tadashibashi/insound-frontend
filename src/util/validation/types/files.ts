import type { SchemaOptions, TSchema } from "@sinclair/typebox";
import { Kind } from "@sinclair/typebox";

export interface TFile extends TSchema {
    [Kind]: "File";
    static: Blob;
}

export interface TFiles extends TSchema {
    [Kind]: "Files";
    static: Blob[] | Blob;
}

export interface FileOptions extends SchemaOptions {
    // Limit the file size
    byteLimit?: number;
    // Types of files accepted
    mimeType?: string | string[];
}

export interface FilesOptions extends FileOptions {
    // Limit the number of files accepted
    fileLimit?: number;
    totalByteLimit?: number;
}

export function FileCheck(options: FileOptions) {
    return function(schema: TFile, value: unknown) {
        if ( !(value instanceof Blob) )
            return false;

        if (options.byteLimit && value.size > options.byteLimit)
            return false;
        
        const mimeType = options.mimeType;
        if (mimeType) {
            if (Array.isArray(mimeType)) {
                if (!mimeType.some(type => value.type.includes(type)))
                    return false;
            } else {
                if (!value.type.includes(mimeType))
                    return false;
            }
        }

        return true;
    }
}

export function FilesCheck(options: FilesOptions) {
    
    return function (schema: TFiles, value: unknown) {
    
        if ( Array.isArray(value) ) {
            let fileCount = 0;
            let byteCount = 0;

            for ( let i = 0; i < value.length; ++i ) {
                const cur = value[i];

                // check class type
                if ( !(cur instanceof Blob) ) {
                    return false;
                }
                
                // check file count limit
                ++fileCount;
                if ( options.fileLimit && fileCount > options.fileLimit ) {
                    return false;
                }
                
                // check single file byte limit
                if ( options.byteLimit && cur.size > options.byteLimit ) {
                    return false;
                }
                
                // check running total byte limit
                byteCount += cur.size;
                if ( options.totalByteLimit && byteCount > options.totalByteLimit ) {
                    return false;
                }

                // check mimetype
                const mimeType = options.mimeType;
                if ( mimeType ) {
                    if ( Array.isArray(mimeType) ) {
                        if ( !mimeType.some(type => cur.type.includes(type)) ) {
                            return false;
                        }
                    } else {
                        if ( !cur.type.includes(mimeType) ) {

                            return false;
                        }
                    }
                }
            }

            return true;
        } else {

            // check class
            if ( !(value instanceof Blob) ) {
                return false;
            }

            // check single file byte limit
            if ( options.byteLimit && value.size > options.byteLimit ) {
                return false;
            }
            
            // check total byte limit just in case
            if ( options.totalByteLimit && value.size > options.totalByteLimit) {
                return false;
            }
            
            // check mimetype
            const mimeType = options.mimeType;
            if ( mimeType ) {
                if ( Array.isArray(mimeType) ) {            // multiple mimetypes allowed
                    if ( !mimeType.some(type => value.type.includes(type)) ) {
                        return false;
                    }
                } else {
                    if ( !value.type.includes(mimeType) ) { // one mimetype allowed
                        return false;
                    }
                }
            }

            return true;
        }
    }
}
