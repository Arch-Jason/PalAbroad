export default function Home() {
  return (
    <div className="text-center mt-5">
      <h1>欢迎来到 PalAbroad</h1>
      <p className="lead">分享签证、住宿信息，寻找你的理想室友和同行出国搭子。</p>
      <div className="mt-4">
        <a href="/register" className="btn btn-primary btn-lg me-3">立即注册</a>
        <a href="/login" className="btn btn-outline-primary btn-lg">登录账号</a>
      </div>
    </div>
  )
}
