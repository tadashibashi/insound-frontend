/* ==========================================================================
 * @file validation/types/insound.ts
 * @description
 *     Contains custom validation classes and initialization
 * ========================================================================== */

import {
    FormatRegistry, JavaScriptTypeBuilder, Kind, TypeRegistry,
    type SchemaOptions, type TProperties
} from "@sinclair/typebox";

import {
    FileCheck, FilesCheck,
    type FileOptions, type FilesOptions, type TFile, type TFiles
} from "./types/files";

import { FormDataCheck, type TFormData } from "./types/formdata";



/**
 * This function sets up several string validators for TypeBox
 */
function setUpFormats() {
    const emailValidator = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

    FormatRegistry.Set("email", value => emailValidator.test(value));
    FormatRegistry.Set("number", value => !isNaN(Number(value)));
}
setUpFormats();

/**
 * Custom type builder where insound app's custom type validations live
 *
 * @class      InsoundTypeBuilder (name)
 */
export class InsoundTypeBuilder extends JavaScriptTypeBuilder {
    Upload(options: FileOptions = {}) {
    
        if (!TypeRegistry.Has("File"))
            TypeRegistry.Set("File", FileCheck(options));
        return {...options, [Kind]: "File"} as TFile;
    }

    Uploads(options: FilesOptions = {}) {

        if (!TypeRegistry.Has("Files"))
            TypeRegistry.Set("Files", FilesCheck(options));

        return {...options, [Kind]: "Files"} as TFiles;
    }

    FormData<T extends TProperties>(properties: T, options: SchemaOptions = {}) {
        if (!TypeRegistry.Has("FormData"))
            TypeRegistry.Set("FormData", FormDataCheck(options));

        return {...options, properties, [Kind]: "FormData"} as TFormData<T>;
    }
}
