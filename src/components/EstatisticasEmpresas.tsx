
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotaFiscal {
  Numero_NF: string;
  Data_Emissao: string;
  MODELO: string;
  ORGANIZATION_ID: number;
  Quantidade: number;
  Empresa: string;
}

interface EstatisticasEmpresasProps {
  faltantes: NotaFiscal[];
}

const EstatisticasEmpresas: React.FC<EstatisticasEmpresasProps> = ({ faltantes }) => {
  const { toast } = useToast();
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const itemsPerPage = 20;

  // Agrupar dados por empresa
  const estatisticasPorEmpresa = faltantes.reduce((acc, nota) => {
    if (!acc[nota.Empresa]) {
      acc[nota.Empresa] = {
        codigo: nota.Empresa,
        totalNotas: 0,
        totalItens: 0,
        notas: []
      };
    }
    acc[nota.Empresa].totalNotas += 1;
    acc[nota.Empresa].totalItens += nota.Quantidade;
    acc[nota.Empresa].notas.push(nota);
    return acc;
  }, {} as Record<string, { codigo: string; totalNotas: number; totalItens: number; notas: NotaFiscal[] }>);

  const exportarExcelEmpresa = async (codigoEmpresa: string) => {
    try {
      const notasEmpresa = estatisticasPorEmpresa[codigoEmpresa].notas;
      
      const dadosExport = notasEmpresa.map(nota => ({
        numero: nota.Numero_NF,
        serie: nota.MODELO,
        data: nota.Data_Emissao,
        empresa: nota.Empresa,
        quantidade: nota.Quantidade
      }));
      
      console.log('Exportando dados da empresa:', codigoEmpresa, dadosExport);
      
      toast({
        title: "Exportação iniciada",
        description: `Exportando ${notasEmpresa.length} notas da empresa ${codigoEmpresa}`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar dados da empresa",
        variant: "destructive"
      });
    }
  };

  const toggleCompanyDetails = (codigo: string) => {
    setExpandedCompany(expandedCompany === codigo ? null : codigo);
    if (!currentPage[codigo]) {
      setCurrentPage(prev => ({ ...prev, [codigo]: 1 }));
    }
  };

  const getPaginatedNotes = (codigo: string) => {
    const empresa = estatisticasPorEmpresa[codigo];
    const page = currentPage[codigo] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return empresa.notas.slice(startIndex, endIndex);
  };

  const getTotalPages = (codigo: string) => {
    const empresa = estatisticasPorEmpresa[codigo];
    return Math.ceil(empresa.notas.length / itemsPerPage);
  };

  const changePage = (codigo: string, newPage: number) => {
    setCurrentPage(prev => ({ ...prev, [codigo]: newPage }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Building className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Estatísticas por Empresa</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(estatisticasPorEmpresa).map((empresa) => (
          <Card key={empresa.codigo} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {empresa.codigo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{empresa.totalNotas}</div>
                  <div className="text-sm text-gray-600">Notas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{empresa.totalItens.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Itens</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => toggleCompanyDetails(empresa.codigo)}
                  className="w-full justify-between"
                  size="sm"
                >
                  <span>Ver Detalhes</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${expandedCompany === empresa.codigo ? 'rotate-90' : ''}`} />
                </Button>
                
                {expandedCompany === empresa.codigo && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {getPaginatedNotes(empresa.codigo).map((nota, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">NF: {nota.Numero_NF}</span>
                            <span className="text-xs text-gray-500">{formatDate(nota.Data_Emissao)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Série: {nota.MODELO}</span>
                            <span>Qtd: {nota.Quantidade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {getTotalPages(empresa.codigo) > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changePage(empresa.codigo, Math.max(1, (currentPage[empresa.codigo] || 1) - 1))}
                          disabled={(currentPage[empresa.codigo] || 1) === 1}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-xs text-gray-600">
                          Página {currentPage[empresa.codigo] || 1} de {getTotalPages(empresa.codigo)}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changePage(empresa.codigo, Math.min(getTotalPages(empresa.codigo), (currentPage[empresa.codigo] || 1) + 1))}
                          disabled={(currentPage[empresa.codigo] || 1) === getTotalPages(empresa.codigo)}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => exportarExcelEmpresa(empresa.codigo)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EstatisticasEmpresas;
