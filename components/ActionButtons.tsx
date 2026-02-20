'use client';

import Link from 'next/link';

export default function ActionButtons({
  userId,
}: {
  userId: string;
}) {
  const handleDownloadStatements = () => {
    window.open(`/api/statements?userId=${userId}`, '_blank');
  };

  return (
    <div className="flex gap-3 mt-4">
      <Link
        href="/send"
        className="flex-1 bg-gray-900 text-white text-center py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Send USD
      </Link>
      <Link
        href="/receive"
        className="flex-1 bg-white text-gray-900 text-center py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Receive USD
      </Link>
      <button
        onClick={handleDownloadStatements}
        className="px-4 bg-white text-gray-500 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Statements
      </button>
    </div>
  );
}
