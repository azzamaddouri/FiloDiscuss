"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const __1 = require("..");
const isAuth_1 = require("../middleware/isAuth");
const Updoot_1 = require("src/entities/Updoot");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(post) {
        return post.text.slice(0, 50);
    }
    vote(postId_1, value_1, _a) {
        return __awaiter(this, arguments, void 0, function* (postId, value, { req }) {
            const isUpdoot = value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const { userId } = req.session;
            const updoot = yield Updoot_1.Updoot.findOne({ where: { postId, userId } });
            if (updoot && updoot.value !== realValue) {
                yield __1.AppDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
    update updoot
    set value = $1
    where "postId" = $2 and "userId" = $3
        `, [realValue, postId, userId]);
                    yield tm.query(` update post
                    set points = points + $1
                    where id = $2`, [2 * realValue, postId]);
                }));
            }
            else if (!updoot) {
                yield __1.AppDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`insert into updoot ("userId", "postId", value)
                      values ($1, $2, $3)`, [userId, postId, realValue]);
                    yield tm.query(`update post
                    set points = points + $1
                    where id = $2`, [realValue, postId]);
                }));
            }
            return true;
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const posts = yield __1.AppDataSource.query(`
            select p.*,
            json_build_object(
            'id', u.id,
            'username' , u.username,
            'email', u.email,
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
             ) creator
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" DESC 
            limit $1
            `, replacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimitPlusOne
            };
        });
    }
    post(id) {
        return Post_1.Post.findOneBy({ id });
    }
    createPost(input_1, _a) {
        return __awaiter(this, arguments, void 0, function* (input, { req }) {
            return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        });
    }
    updatePost(id_1, title_1, text_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, title, text, { req }) {
            const result = yield __1.AppDataSource.getRepository(Post_1.Post)
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning("*")
                .execute();
            return result.raw[0];
        });
    }
    deletePost(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { req }) {
            const post = yield Post_1.Post.findOneBy({ id });
            if (!post) {
                return false;
            }
            if (post.creatorId !== req.session.userId) {
                throw new Error("not authorized");
            }
            yield Post_1.Post.delete({ id });
            yield Post_1.Post.delete({ id, creatorId: req.session.userId });
            return true;
        });
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("title")),
    __param(2, (0, type_graphql_1.Arg)("text")),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
//# sourceMappingURL=post.js.map