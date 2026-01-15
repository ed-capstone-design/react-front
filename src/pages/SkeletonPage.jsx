

const SkeletonPage = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700">시스템 초기화 중...</h2>
                <p className="text-gray-500">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
}

export default SkeletonPage;