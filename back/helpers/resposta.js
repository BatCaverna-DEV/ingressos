export const sucesso = (res, dados, mensagem = 'OK', status = 200) =>
  res.status(status).json({ sucesso: true, mensagem, dados });

export const erro = (res, mensagem = 'Erro interno', status = 500, detalhes = null) =>
  res.status(status).json({ sucesso: false, mensagem, detalhes });
