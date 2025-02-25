import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { ObjectType } from "type-graphql";

// m to n
// many to many
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {

    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    // Cascade way to delete the updoots for a post
    @ManyToOne(() => Post, (post) => post.updoots, {
        onDelete: "CASCADE",
    })
    post: Post;
}