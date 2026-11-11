INSERT INTO "categories" ("id", "name", "slug", "description")
VALUES
    (gen_random_uuid(), 'Livros', 'livros', 'Livros didáticos, técnicos e de literatura'),
    (gen_random_uuid(), 'Apostilas e Materiais', 'apostilas-e-materiais', 'Apostilas, resumos, cadernos e material escolar'),
    (gen_random_uuid(), 'Eletrônicos', 'eletronicos', 'Celulares, fones, câmeras e outros eletrônicos'),
    (gen_random_uuid(), 'Informática', 'informatica', 'Computadores, notebooks, periféricos e componentes'),
    (gen_random_uuid(), 'Calculadoras', 'calculadoras', 'Calculadoras científicas, financeiras e gráficas'),
    (gen_random_uuid(), 'Móveis', 'moveis', 'Mesas, cadeiras, estantes e outros móveis'),
    (gen_random_uuid(), 'Eletrodomésticos', 'eletrodomesticos', 'Geladeiras, micro-ondas, ventiladores e afins'),
    (gen_random_uuid(), 'Roupas e Acessórios', 'roupas-e-acessorios', 'Roupas, calçados, jalecos e acessórios'),
    (gen_random_uuid(), 'Esportes', 'esportes', 'Artigos e equipamentos esportivos'),
    (gen_random_uuid(), 'Instrumentos Musicais', 'instrumentos-musicais', 'Instrumentos e equipamentos de áudio'),
    (gen_random_uuid(), 'Material de Laboratório', 'material-de-laboratorio', 'Kits de eletrônica, EPIs e material de laboratório'),
    (gen_random_uuid(), 'Transporte', 'transporte', 'Bicicletas, patinetes e caronas'),
    (gen_random_uuid(), 'Serviços', 'servicos', 'Aulas particulares, monitorias e outros serviços'),
    (gen_random_uuid(), 'Outros', 'outros', 'Itens que não se encaixam nas demais categorias')
ON CONFLICT ("slug") DO NOTHING;
