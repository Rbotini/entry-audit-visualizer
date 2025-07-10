
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Download, FileCheck, FileX } from 'lucide-react';
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
      
      // Simular export para Excel (aqui você faria a chamada real para a API)
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
      
      // Aqui você faria a chamada real para a API de exportação
      // const response = await fetch(`http://localhost:8000/exportar_excel_empresa?empresa=${codigoEmpresa}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dadosExport)
      // });
      
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar dados da empresa",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Building className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Estatísticas por Empresa</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(estatisticasPorEmpresa).map((empresa, index) => (
          <Card key={empresa.codigo} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold">Empresa {empresa.codigo}</span>
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileX className="h-5 w-5 text-red-600" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{empresa.totalNotas}</p>
                  <p className="text-sm text-red-700">Notas Não Encontradas</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{empresa.totalItens}</p>
                  <p className="text-sm text-orange-700">Total de Itens</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Notas Faltantes:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {empresa.notas.slice(0, 5).map((nota, i) => (
                    <div key={i} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                      <span>NF: {nota.Numero_NF}</span>
                      <span>Série: {nota.MODELO}</span>
                    </div>
                  ))}
                  {empresa.notas.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{empresa.notas.length - 5} notas
                    </p>
                  )}
                </div>
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
