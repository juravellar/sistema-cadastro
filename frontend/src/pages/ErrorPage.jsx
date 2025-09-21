import { useLocation, useNavigate } from "react-router-dom";

function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const message =
    searchParams.get("message") ||
    location.state?.message ||
    "Página não encontrada";
  const status = searchParams.get("status") || location.state?.status || "404";
  const stack = location.state?.stack;

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="content-container">
      <div className="container mt-4 text-center">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h1 className="display-1 text-danger">{status}</h1>
                <h2 className="mb-4">{message}</h2>

                {stack && (
                  <div className="mt-4">
                    <h5>Detalhes do erro:</h5>
                    <pre className="text-start bg-light p-3 rounded">
                      <code>{stack}</code>
                    </pre>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    className="btn btn-primary mr-2"
                    onClick={handleGoHome}
                  >
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
