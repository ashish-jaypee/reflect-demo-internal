import { useState, useEffect } from 'react';
import { Badge, Select, Spinner, Alert } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { Table } from 'flowbite-react';
import { useInstitutionalStore } from '../../data/institutional/institutionalStore';

const UsersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Zustand store integration
  const {
    userManagementTable: { data, loading, error, pagination },
    fetchUserManagementTable,
  } = useInstitutionalStore();
  console.log('UsersTable data:', data);
  console.log('UsersTable pagination:', pagination);
  console.log('UsersTable loading:', loading);
  console.log('UsersTable error:', error);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserManagementTable({
        page: currentPage,
        limit: itemsPerPage,
      });
    };

    fetchData();
  }, [currentPage, itemsPerPage, fetchUserManagementTable]);

  const totalPages = pagination?.total_pages || 1;
  const totalCount = pagination?.total_count || 0;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'yellow';
      case 'suspended':
        return 'red';
      default:
        return 'info';
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="card-title">User Analytics</h5>
          <p className="card-subtitle">Comprehensive user data analytics</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap ml-auto">
            <Select
              value={itemsPerPage.toString()}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="min-w-[100px]"
              disabled={loading}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Select>
          </div>
        </div>
      </div>
      {/* Error State */}
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          <span className="font-medium">Error loading data:</span> {error}
        </Alert>
      )}

      {/* Results summary */}
      <div className="mb-4">
        <p className="text-sm text-bodytext">
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Loading...
            </span>
          ) : (
            <>
              Showing {data.length} of {totalCount} results
            </>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>User Details</Table.HeadCell>
            <Table.HeadCell>Grand Tests Taken</Table.HeadCell>
            <Table.HeadCell>Avg Score</Table.HeadCell>
            <Table.HeadCell>Signup Date</Table.HeadCell>
            <Table.HeadCell>Last Login</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center gap-2">
                    <Spinner size="md" />
                    <span>Loading data...</span>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">No user data available.</div>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.map((item, index) => (
                <Table.Row key={`${item.email}-${index}`} className="hover:bg-lightprimary/20">
                  <Table.Cell>
                    <div>
                      <div className="font-medium text-dark dark:text-white">{item.user_name}</div>
                      <div className="text-sm text-bodytext">{item.email}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-center font-medium">
                    <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {item.tests_completed}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getScoreBadgeColor(item.avg_score)} className="justify-center">
                      {item.avg_score}%
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">{formatDate(item.join_date)}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">{formatDate(item.last_login)}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusBadgeColor(item.status)}>{item.status}</Badge>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-bodytext">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Previous
            </button>

            {/* Windowed Pagination Logic */}
            {(() => {
              const pageButtons = [];
              const window = 2; // pages to show around current
              const showFirst = 1;
              const showLast = totalPages;

              for (let i = 1; i <= totalPages; i++) {
                if (
                  i === showFirst ||
                  i === showLast ||
                  (i >= currentPage - window && i <= currentPage + window)
                ) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg min-w-[32px] ${
                        currentPage === i
                          ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-gray-700 dark:text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {i}
                    </button>,
                  );
                } else if (
                  (i === currentPage - window - 1 && i > showFirst) ||
                  (i === currentPage + window + 1 && i < showLast)
                ) {
                  pageButtons.push(
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                      ...
                    </span>,
                  );
                }
              }
              return pageButtons;
            })()}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { UsersTable };
