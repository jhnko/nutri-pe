import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface AuthRequest<
	TParams extends ParamsDictionary = ParamsDictionary,
	TResBody = any,
	TReqBody = any,
	TReqQuery extends ParsedQs = ParsedQs,
	TLocals extends Record<string, any> = Record<string, any>,
> extends Request<TParams, TResBody, TReqBody, TReqQuery, TLocals> {
	user_id?: string;
	username?: string;
}
