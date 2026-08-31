/**
 * Sala de espera: cobre a página por ~3s na primeira visita da sessão.
 * Some sozinha, com clique, ou imediatamente se a pessoa já foi atendida
 * nesta aba (sessionStorage). Server component + script inline para não
 * piscar nem depender da hidratação.
 */
export function Cortina({ senha }: { senha: number }) {
  const script = `
(function(){
  var c=document.getElementById('cortina');
  if(!c)return;
  try{if(sessionStorage.getItem('dta-atendido')){c.remove();return}}catch(e){}
  var fim=function(){try{sessionStorage.setItem('dta-atendido','1')}catch(e){}
    if(c.parentNode)c.remove()};
  c.addEventListener('click',fim);
  setTimeout(fim,3500);
})();`;

  return (
    <>
      <div className="cortina" id="cortina" role="status" aria-label="Aguardando atendimento">
        <div>
          <div className="cortina-org">Departamento de Términos e Aberturas · Guichê 08</div>
          <div className="cortina-rotulo">sua senha</div>
          <div className="cortina-senha">{String(senha).padStart(3, "0")}</div>
          <div className="cortina-linha">Um momento · aguardando atendimento...</div>
          <div className="cortina-linha demora">Você é o próximo da fila <span className="pisca">▮</span></div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
