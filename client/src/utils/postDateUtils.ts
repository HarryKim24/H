export const formatPostDate = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  const diffMinutes = Math.floor(diff / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else {
    return `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, '0')}.${String(createdDate.getDate()).padStart(2, '0')}`;
  }
};
