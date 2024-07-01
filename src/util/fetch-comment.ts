import { Res } from '../app/api/comment/route';
import { Comment } from '../types';

export const fetchPostComment = async (
  content: string,
  accountId: number,
  cycleId: number,
) => {
  try {
    const res = await fetch(`/api/comment`, {
      method: 'POST',
      cache: 'no-store',
      body: JSON.stringify({
        content: content,
        accountId: accountId,
        cycleId: cycleId,
      }),
    });
    const result: Comment = (await res.json()) as Comment;
    return result;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const fetchPutComment = async (content: string, id: number) => {
  try {
    const res = await fetch(`/api/comment`, {
      method: 'PUT',
      cache: 'no-store',
      body: JSON.stringify({
        content: content,
        id: id,
      }),
    });
    const result: Comment = (await res.json()) as Comment;
    return result;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const fetchDeleteComment = async (id: number) => {
  try {
    const res = await fetch(`/api/comment?commentId=${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    const result: Res = (await res.json()) as Res;
    return result;
  } catch (err) {
    console.error(err);
    return { message: 'error' };
  }
};
