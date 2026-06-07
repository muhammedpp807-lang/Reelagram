export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  verified?: boolean;
  followers: string[]; // user ids
  following: string[]; // user ids
};

export type Post = {
  id: string;
  userId: string;
  type: "image" | "reel";
  mediaUrl: string;
  thumbnail?: string;
  caption: string;
  audio?: string;
  views?: number;
  likes: string[]; // user ids who liked
  comments: Comment[];
  createdAt: number;
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
};
